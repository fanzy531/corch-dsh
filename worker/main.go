// teaching-worker 是独立 Go 服务；配置只从 serve -c 指定的文件读取。
package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/fanzy531/corch-dsh/worker/internal/config"
	"github.com/fanzy531/corch-dsh/worker/internal/service"
	"github.com/spf13/cobra"
)

func newCommand() *cobra.Command {
	root := &cobra.Command{Use: "teaching-worker", Short: "教改访谈追问和报告 Worker", SilenceUsage: true, SilenceErrors: true}
	var path string
	serve := &cobra.Command{Use: "serve", Short: "按配置启动任务服务", Args: cobra.NoArgs, RunE: func(cmd *cobra.Command, _ []string) error {
		c, err := config.Load(path)
		if err != nil {
			return err
		}
		return service.Serve(cmd.Context(), c, slog.New(slog.NewJSONHandler(os.Stdout, nil)))
	}}
	serve.Flags().StringVarP(&path, "config", "c", "", "YAML 配置文件路径")
	_ = serve.MarkFlagRequired("config")
	root.AddCommand(serve)
	return root
}
func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	if err := newCommand().ExecuteContext(ctx); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
