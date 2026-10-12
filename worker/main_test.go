package main

import (
	"io"
	"strings"
	"testing"
)

func TestServeRequiresConfig(t *testing.T) {
	c := newCommand()
	c.SetOut(io.Discard)
	c.SetErr(io.Discard)
	c.SetArgs([]string{"serve"})
	err := c.Execute()
	if err == nil || !strings.Contains(err.Error(), "config") {
		t.Fatalf("expected required config, got %v", err)
	}
}
func TestServeRejectsPositionals(t *testing.T) {
	c := newCommand()
	c.SetArgs([]string{"serve", "unexpected", "-c", "missing.yaml"})
	if c.Execute() == nil {
		t.Fatal("unexpected argument accepted")
	}
}
